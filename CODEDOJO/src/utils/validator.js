import validator from 'validator';


const validate = (data)=>{

const mandatoryFields = ['firstName', 'emailID', 'password'];
const IsAllowed = mandatoryFields.every((k) => Object.keys(data).includes(k));

if(!IsAllowed){
    throw new Error('Missing mandatory fields');
};

if(!validator.isEmail(data.emailID)){
    throw new Error('Invalid Email ID');
}
// Check password requirements: 8+ chars, lowercase, uppercase, number
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
if(!passwordRegex.test(data.password)){
    throw new Error('Password must be at least 8 characters with lowercase, uppercase, and number');
}
}
export default validate;