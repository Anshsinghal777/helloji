import mongoose from 'mongoose';



     export default async function main(){
     console.log('DB_CONNECT_STRING:', process.env.DB_CONNECT_STRING);
     await mongoose.connect(process.env.DB_CONNECT_STRING);

}


// mongodb+srv://carlsen_777:Mohit2004%23@ansh.nsoc7ej.mongodb.net/?retryWrites=true&w=majority&tls=true