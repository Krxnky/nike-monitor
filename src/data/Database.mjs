import mongoose from "mongoose";

class Database
{
    static connect() {
        mongoose.connect(process.env.DB_URL, {
            useNewUrlParser: true, useUnifiedTopology: true
        })
            .then(
                () => console.log(`connected to database: ${process.env.DB_URL}`),
                (err) => console.error('could not connect to database!')
            )
    }
}

export default Database;