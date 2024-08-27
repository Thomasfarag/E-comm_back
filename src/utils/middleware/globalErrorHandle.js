
// const globalError = (err, req, res, next) => {
//   res.status(err.statusCode).json({ message: `error`, err: err.message });
// };



export const globalError=(err, req, res, next)=> {
  const statusCode =err.status  || 500;
  res.status( statusCode).json( {message:err.message}) ;
}
export default globalError
