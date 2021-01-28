/**
 * [Checks if the condition value is valid.]
 * @param  {String} condition [Contains the rule for validation operation, e.g ["gt", "gte"].]
 * @param  {Object} res [Response for sending a feeback to the client.]
 * @return {JSON}      [Returns back the appropriate response to user based on the validation operation.]
 */
exports.checkConditionOperator = (condition, res) => {
    const condition_operators = ["eq","neq", "gt", "gte", "contains"]
    //Bails if condtion doesn't match the above array
    if(!condition_operators.includes(condition)){
        res.status(400).json({
            message: "condition doesn't exists.",
            status: "error",
            data: null
        })
        return
    }
}
/**
 * [Checks if the required object keys are passed in the JSON request.]
 * @param  {Object} object [Contains JSON body request data.]
 * @param  {Object} res [Response for sending a feeback to the client.]
 * @return {JSON}      [Returns back the appropriate response to user based on the validation operation.]
 */
exports.validateRequiredObjectKeys = (object, res) => {
    const rule_props = ["field", "condition", "condition_value"]
    //Bails if the JSON data doesn't have the "rule" key
    if(!object.hasOwnProperty("rule")){
        res.status(400).json({
            message: "rule is required.",
            status: "error",
            data: null
        })
        return
    }
    //Bails if the  nested datatype of "rule" isn't an Object.
    if(typeof(object.rule) !== "object") {
        res.status(400).json({
            message: "rule must be a type Object.",
            status: "error",
            data: null
        })
        return
    }
    //Bails if the JSON data doesn't have the "data" key.
    if(!object.hasOwnProperty("data")){
        res.status(400).json({
            message: "data is required.",
            status: "error",
            data: null
        })
        return
    }
    //Bails if the "rule" property doesn't have the listed props in "rule_props".
    for(i = 0; i < rule_props.length; i++){
        if(!object.rule.hasOwnProperty(rule_props[i])){
            res.status(400).json({
                message: `${rule_props[i]} is required.`,
                status: "error",
                data: null
            })
            return
        }
    }
}
/**
 * [Checks if the field property exists in the data property.]
 * @param  {String} field_name [Contains the name of the property that needs the validation check.]
 * @param  {Object} object [Contains JSON body request data.]
 * @param  {Object} res [Response for sending a feeback to the client.]
 * @return {field_value}      [Returns the value of the property that needs the validation check.]
 */
exports.getFieldValue = (field_name, object, res) => {
    let field_value
    //checks if the field value is nested.
    if(field_name.includes(".")){
        const split_fields = field_name.split(".")
        //Bails if nesting is above two steps e.g "person.missions.test"
        if(split_fields.length > 2){
            res.status(400).json({
                message: "nesting limited to two steps.",
                status: "error",
                data: null
            })
            return
        }
        if(object.hasOwnProperty(split_fields[0])){
            if(object[split_fields[0]].hasOwnProperty(split_fields[1])){
                field_value = object[split_fields[0]][split_fields[1]]
            } else {
                res.status(400).json({
                    message: `field ${split_fields[1]} is missing from ${split_fields[0]}.`,
                    status: "error",
                    data: null
                })
                return
            }
        } else {
            res.status(400).json({
                message: `field ${field_name} is missing from data.`,
                status: "error",
                data: null
            })
            return
        }
    }else {
        if(object.hasOwnProperty(field_name)){
            field_value = object[field_name]
        }else {
            res.status(400).json({
                message: `field ${field_name} is missing from data.`,
                status: "error",
                data: null
            })
            return
        }
    }
    return field_value
}
/**
 * [Returns a JSON response based on the validation operation.]
 * @param  {Boolean} error [If true, returns and error response. If false, returns a success response.]
 * @param  {String} field [The name of the field.]
 * @param  {String||Number} field_value [The value of the field property]
 * @param  {String} condition [Contains the rule for validation operation, e.g ["gt", "gte"].]
 * @param  {String||Number} condition_value [Contains the value of the operand that triggers the validation operation.]
 * @param  {Object} res [Response for sending a feeback to the client.]
 * @return {JSON}      [Returns back the appropriate response to user based on the validation operation.]
 */
const returnResponse = ({ error, field, field_value, condition, condition_value, res}) => {
    if(error) {
        return res.status(200).json({
            message: `field ${field} failed validation.`,
            status: "error",
            data: {
                validation: {
                    error: true,
                    field: field,
                    field_value: field_value,
                    condition: condition,
                    condition_value: condition_value
                }
            }
        })
    } else {
        return res.status(400).json({
            message: `field ${field} successfully validated.`,
            status: "success",
            data: {
                validation: {
                    error: false,
                    field: field,
                    field_value: field_value,
                    condition: condition,
                    condition_value: condition_value
                }
            }
    })
    }
}

//Runs Validation Operation
exports.runValidation = ({condition, field_value, condition_value, field, res}) => {
    switch (condition) {
        case "gte":
            if(field_value >= condition_value){
                returnResponse({ error: false, field, field_value, condition, condition_value, res})
        } else {
            returnResponse({ error: true, field, field_value, condition, condition_value, res})
        }
        case "eq":
            if(field_value === condition_value) {
                returnResponse({ error: false, field, field_value, condition, condition_value, res})
            }else {
                returnResponse({ error: true, field, field_value, condition, condition_value, res})
            }
        case "neq":
            if(field_value !== condition_value) {
                returnResponse({ error: false, field, field_value, condition, condition_value, res})
            }else {
                returnResponse({ error: true, field, field_value, condition, condition_value, res})
            }
        case "gt":
            if(field_value > condition_value){
                returnResponse({ error: false, field, field_value, condition, condition_value, res})
        } else {
            returnResponse({ error: true, field, field_value, condition, condition_value, res})
        }
        case "contains":
            if(String(field_value).includes(condition_value)){
                returnResponse({ error: false, field, field_value, condition, condition_value, res})
        } else {
            returnResponse({ error: true, field, field_value, condition, condition_value, res})
        }
        default:
            break;
    }
}