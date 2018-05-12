import is from 'is_js'
import handlerMatcher, {
    RuleWhichNeedsArray,
    RuleWhichNeedsBoolean
} from "./matchers";

export const FieldStatus = {
    ok: 'ok',
    error: 'error',
    normal: 'normal'
};

export function createNewFieldState() {
    return {
        status: FieldStatus.normal,
        errorText: '',
        value: undefined
    };
}

/**
 * throw an error with defined text, usually calls by ruleRunner().
 */
export function throwError(
    value,
    errorText
  ) {
    // eslint-disable-next-line no-throw-literal
    throw { value, errorText, status: FieldStatus.error };
}

function extractUserDefinedMsg(
    handlerName,
    schema
  ) {
    const userErrorTextKey = `${handlerName}_userErrorText`;  
    const result = { schema, userErrorText: '' };
  
    // No user message or already processed
    if (is.not.array(schema[handlerName])) {
        if (schema[userErrorTextKey]) {
            result.userErrorText = result.schema[userErrorTextKey];
        }
        return result;
    }    
    const currentSchema = schema[handlerName];
  
    // Handle the case where the value of rule is array
    if (RuleWhichNeedsArray.includes(handlerName)) {
      // No user message, just return
      if (is.not.array(currentSchema[0])) return result;
    }
  
    // The most common case: [0] is rule and [1] is errText
    const [rule, errText] = currentSchema;
    result.schema[handlerName] = rule;
    result.schema[userErrorTextKey] = errText;
    result.userErrorText = errText;
    return result;
}

function grabValueForReliesField(
    allSchema,
    allState,
    reliedFieldName
  ) {
    let result;
  
    if (
        allState[reliedFieldName] != null &&
        allState[reliedFieldName].value != null
    ) {
        result = allState[reliedFieldName].value
    }
    else if (
        allSchema.collectValues != null &&
        allSchema.collectValues[reliedFieldName] != null
    ) {
        result = getNestedValue(
            allSchema.collectValues[reliedFieldName],
            allState
        )
    }
  
    return result;
}

function isOnlyWhenFulfilled(
    fieldOnlyWhenSchema,
    fieldState,
    allSchema,
    allState
  ) {
    return Object.keys(fieldOnlyWhenSchema).every(reliedFieldName => {
        const reliesKeySchema = fieldOnlyWhenSchema[reliedFieldName];
  
        return Object.keys(reliesKeySchema).every(rule => {
            const reliedFieldValue = grabValueForReliesField(
                allSchema,
                allState,
                reliedFieldName
            );
    
            try {
                ruleRunner(
                    rule,
                    handlerMatcher[rule],
                    reliedFieldName,
                    reliedFieldValue, // Here we need to swap the field value to the target value
                    reliesKeySchema
                );
            } catch (err) {
                return false;
            }
    
            return true;
        });
    });
}

function runMatchers(
    matcher,
    fieldState,
    fieldSchema,
    fieldName,
    allSchema,
    allState
  ) {
    const fieldRules = fieldSchema[fieldName];
  
    if (fieldRules.onlyWhen != null) {
        if (allSchema && allState) {
            const result = isOnlyWhenFulfilled(
                fieldRules.onlyWhen,
                {...fieldState},
                allSchema,
                allState
            );
    
            if (result === false) {
                fieldState.status = FieldStatus.normal;
                return fieldState;
            }
        }
    }
  
    if (
        fieldRules.beforeValidation != null
    ) {
        fieldState.value = handleBeforeValidation(
            fieldState.value,
            fieldRules.beforeValidation
        );
    }
  
    Object.keys(fieldRules).forEach(ruleInSchema => {
      if (ruleInSchema === 'reliesOn') {
        const fieldReliesOnSchema = fieldSchema[fieldName].reliesOn;
        if (allSchema && allState && (fieldReliesOnSchema != null) ) {
            handleReliesOn(
                fieldReliesOnSchema,
                fieldState,
                allSchema,
                allState
            )
        }
      }
      else {
        // eslint-disable-next-line no-use-before-define
        ruleRunner (
            ruleInSchema,
            matcher[ruleInSchema],
            fieldName,
            fieldState.value,
            fieldRules
        );
      }
  
      // TODO: Do something when the rule is not match
      // else if (ruleInSchema !== 'default') {
      // }
    });
    return fieldState;
}

function ruleRunner(
    ruleName,
    ruleHandler,
    fieldName,
    value,
    fieldRules
  ) {
    if (ruleHandler == null) {
        if (ruleName.indexOf('_userErrorText') === -1){
            console.warn(`${ruleName} is invalid. Please check the online doc for more reference: https://albert-gao.github.io/veasy/#/rules`);
        }            
        return;
    }
  
    const { schema, userErrorText } = extractUserDefinedMsg (
        ruleName,
        fieldRules
    );
  
    if (RuleWhichNeedsBoolean.includes(ruleName)) {
        if (schema[ruleName] === false) return;
    }
  
    const result = ruleHandler(fieldName, value, schema);
    if (result.isValid) return;
  
    throwError(value, userErrorText || result.errorText);
}

export function rulesRunner(
    value,
    fieldSchema,
    fieldName,
    allSchema,
    allState
  ) {
    const fieldState = createNewFieldState();
    fieldState.value = value;
  
    if (
        is.existy(value) &&
        is.not.empty(value)
    ) {
        fieldState.status = FieldStatus.ok;
    }
  
    try {
        return runMatchers(
            handlerMatcher,
            fieldState,
            fieldSchema,
            fieldName,
            allSchema,
            allState
        );
    } catch (err) {
        return err;
    }
}