const express = require("express");
const { checkConditionOperator, validateRequiredObjectKeys, getFieldValue, runValidation } = require("./utils");

const app = express()

//BODY_PARSER MIDDLWWARE
app.use(express.json())





//base route
app.get("/", (req, res) => {
    res.status(200).json({
        message: "My Rule-Validation API",
        status: "success",
        data: {
            name: "Arinze Jeffrey",
            github: "@ArinzeJeffrey-droid",
            email: "nnamenearinze@gmail.com",
            mobile: "09046383371",
            twitter: "@nnamenearinze"
        }
    })
})

//Rule validation route
app.post("/validate-rule", (req, res) => {
    validateRequiredObjectKeys(req.body, res)
    const { field, condition, condition_value } = req.body.rule
    checkConditionOperator(condition, res)
    const { data } = req.body
    const field_value = getFieldValue(field, data, res)
    runValidation({condition, field_value, condition_value, field, res})
})





const port = 4200

app.listen(port, () => console.log(`Listening on port ${port}`))