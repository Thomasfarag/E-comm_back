

// req.body {name:"ahmed"}
// req.params {id:123}
// req.query {test:"btee5"}
export const validation = (schema) => {
    return (req, res, next) => {

        let inputs = { ...req.body, ...req.params, ...req.query }
        console.log(inputs,"inputs");
        let { error } = schema.validate(inputs, { abortEarly: false });
        if (error) {
                    let errors = error.details.map((detail) => detail.message);
                    res.json(errors);
        } else {
            next()
        }

    }

}

