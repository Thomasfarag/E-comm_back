
import Joi from "joi";



export const createBrandSchema = Joi.object({
  name: Joi.string().min(2).max(30).required(),
},);

// tehagsfdhagsfdhagdfahdfahgdfadgfad

export const updateBrandSchema = Joi.object({
    name: Joi.string().min(2).max(30).required(),
    id: Joi.string().hex().length(24).required()
});

