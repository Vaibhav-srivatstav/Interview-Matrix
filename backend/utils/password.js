// utils/password.js
const isStrongPassword = pwd => 
  /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+={}\[\]|:;"'<>,.?/-]).{8,}$/.test(pwd);
 export default isStrongPassword;
