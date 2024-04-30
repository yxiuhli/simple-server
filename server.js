const mongoose = require("mongoose")
const express = require('express')
const cors = require('cors')
const app = express()
const port = 9000

app.use(express.json())
app.use(cors())
const db = mongoose.connect('mongodb+srv://testUser:1234@cluster0.eugrwrv.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');

const userSchema = new mongoose.Schema({ username: String, email: String, password: String });
const patientSchema = new mongoose.Schema({ name: String, phone: String, address: String, dob: String, gender: String });
const staffSchema = new mongoose.Schema({ name: String, dob: String, gender: String, startedWork: String, job: String });
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

app.get('/doctors/:id', async (req, res) => {
    const doctorStaff = await Staff.findOne({_id: req.params.id, job: "doctor"});
    if (!doctorStaff) {
        return res.status(404).json({message: "Doctor not found"});
    }
    const doctorInfo = await Doctor.findOne({staffId: doctorStaff._id});
    const degree = doctorInfo.degree;
    const doctor = { ...doctorStaff._doc, degree};
    console.log(doctor);
    return res.json(doctor);
});

app.delete('/doctors/:id', async (req, res) => {
    console.log("deleting")
    const doctorStaff = await Staff.findOneAndDelete({_id: req.params.id})
    if (!doctorStaff) {
        return res.status(404).json({message: "Doctor not found"});
    }
    return res.json(doctorStaff);
});
app.post('/doctors/add', async (req, res) => {
    console.log("adding")
    const {name, dob, gender, start, degree} = req.body
    const doctor = {name, dob, gender, startedWork: start, job: "doctor"}
    const staff = await Staff.create(doctor)
    const doctorDegree = {degree, staffId: staff._id}
    const newDoc = await Doctor.create(doctorDegree)
    return res.json(newDoc);
});
app.post('/doctors/update/:id', async (req, res) => {
    console.log("updating")
    const {name, dob, gender, start, degree} = req.body
    const doctor = {name, dob, gender, startedWork: start}
    const staff = await Staff.updateOne({_id: req.params.id}, doctor, {})
    
    const updatedDoc = await Doctor.updateOne({staffId: staff._id}, {degree}, {})
    return res.json(updatedDoc);
});


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
