const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    tenant: { type: String, required: true },
    twoFactorSecret: { type: String, required: false },
    twoFactorEnabled: { type: Boolean, required: false, default: false },
});

async function checkUsers() {
    const connection = await mongoose.connect('mongodb://localhost:27017/jacando', { useNewUrlParser: true, useUnifiedTopology: true });
    const User = connection.model('User', userSchema);

    const users = await User.find();
    console.log(users);

    await connection.disconnect();
}

checkUsers().catch(err => console.error(err));
