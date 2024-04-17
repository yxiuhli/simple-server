const mongoose = require("mongoose")
const express = require('express')
const cors = require('cors')
const app = express()
const port = 9000

app.use(express.json())
app.use(cors())
const db = mongoose.connect('mongodb+srv://testUser:1234@cluster0.eugrwrv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const userSchema = new mongoose.Schema({ username: String, email: String, password: String });
const patientSchema = new mongoose.Schema({ name: String, phone: String, address: String, dob: Date, gender: String });
const staffSchema = new mongoose.Schema({ name: String, dob: Date, gender: String, startedWork: Date, job: String });
const doctorSchema = new mongoose.Schema({ degree: String, staffId: String });

const User = mongoose.model('User', userSchema);
const Patient = mongoose.model('Patient', patientSchema);
const Staff = mongoose.model('Staff', staffSchema);
const Doctor = mongoose.model('Doctor', doctorSchema);

if (db) {
	console.log('Connected to mongoose server')
} else {
	console.log('error')
}

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.get('/users', async (req, res) => {
    const users = await User.find()
    return res.json(users)
})

app.post('/auth/login', async (req, res) => {
    console.log("logining")
    const { email, password } = req.body
    const user = await User.findOne({email, password})
    return res.json(user)
})

app.post('/auth/register', async (req, res) => {
    console.log("registering")
    return res.json("registered")
})

app.get('/patients', async (req, res) => {
    const patients = await Patient.find()
    return res.json(patients)
})

app.get('/doctors', async (req, res) => {
    const doctorStaffs = await Staff.find({job : "doctor"})
    doctors = await Promise.all(
    	doctorStaffs.map(async (doctor) => {
    	const doctorInfo = await Doctor.findOne({staffId: doctor._id}) 
    	const degree = doctorInfo.degree
    	return { ...doctor._doc, degree}
    }))
    console.log(doctors)
    return res.json(doctors)
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
