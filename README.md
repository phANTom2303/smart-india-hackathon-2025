# smart-india-hackathon-2025
SIH 25 Repo for Team Jugaadonauts


# MongoDB Manual Seeding Commands : 

Run the following commands in the correct order in mongoshell to seed the DB with sample data.

## Organizations : 

```mongoshell
use sih2025


db.organizations.insertMany([
  { name: "Aarambh Seva Trust", type: "NGO", status: "APPROVED", createdAt: new Date(), updatedAt: new Date() },
  { name: "Annapurna Foundation", type: "NGO", status: "PENDING", createdAt: new Date(), updatedAt: new Date() },
  { name: "Jagruti Mahila Mandal", type: "NGO", status: "APPROVED", createdAt: new Date(), updatedAt: new Date() },
  { name: "Swasthya Seva Sansthan", type: "NGO", status: "PENDING", createdAt: new Date(), updatedAt: new Date() },
  { name: "Pragati Gramin Vikas", type: "NGO", status: "REJECTED", createdAt: new Date(), updatedAt: new Date() },
  { name: "Gram Vikas Panchayat, Gadchiroli", type: "PANCHAYAT", status: "APPROVED", createdAt: new Date(), updatedAt: new Date() },
  { name: "Nirmal Jal Panchayat, Sikar", type: "PANCHAYAT", status: "PENDING", createdAt: new Date(), updatedAt: new Date() },
  { name: "Sujal Safai Panchayat, Udupi", type: "PANCHAYAT", status: "APPROVED", createdAt: new Date(), updatedAt: new Date() },
  { name: "Hariyali Gram Panchayat, Valsad", type: "PANCHAYAT", status: "PENDING", createdAt: new Date(), updatedAt: new Date() },
  { name: "Kisan Mitra Panchayat, Wardha", type: "PANCHAYAT", status: "REJECTED", createdAt: new Date(), updatedAt: new Date() }
])
```
## Projects : 

```
use sih2025
var now = new Date();

db.projects.insertMany([
  {
    name: "Ratnagiri Mangrove Restoration Drive",
    organization: ObjectId("68ca922e414897cd32ce5f47"), // Aarambh Seva Trust
    location: "Ratnagiri, Maharashtra",
    projectArea: 120,
    baselineData: { habitat: "mangrove", species: ["Rhizophora", "Avicennia"], baselineCarbon_tCO2e: 1500 },
    status: "ACTIVE",
    createdAt: now, updatedAt: now
  },
  {
    name: "Nagapattinam Coastal Shelterbelt",
    organization: ObjectId("68ca922e414897cd32ce5f49"), // Jagruti Mahila Mandal
    location: "Nagapattinam, Tamil Nadu",
    projectArea: 85,
    baselineData: { habitat: "coastal belt", species: ["Casuarina", "Pongamia"], baselineCarbon_tCO2e: 980 },
    status: "ACTIVE",
    createdAt: now, updatedAt: now
  },
  {
    name: "Udupi Beach Casuarina Plantation",
    organization: ObjectId("68ca922e414897cd32ce5f4e"), // Sujal Safai Panchayat, Udupi
    location: "Udupi, Karnataka",
    projectArea: 60,
    baselineData: { habitat: "sandy beach", species: ["Casuarina", "Spinifex"], baselineCarbon_tCO2e: 620 },
    status: "ACTIVE",
    createdAt: now, updatedAt: now
  },
  {
    name: "Valsad Dune Stabilization Plantation",
    organization: ObjectId("68ca922e414897cd32ce5f4f"), // Hariyali Gram Panchayat, Valsad
    location: "Valsad, Gujarat",
    projectArea: 75,
    baselineData: { habitat: "coastal dunes", species: ["Ipomoea pes-caprae", "Casuarina"], baselineCarbon_tCO2e: 710 },
    status: "DRAFT",
    createdAt: now, updatedAt: now
  },
  {
    name: "Nellore Coastal Shelterbelt",
    organization: ObjectId("68ca922e414897cd32ce5f48"), // Annapurna Foundation
    location: "Nellore, Andhra Pradesh",
    projectArea: 95,
    baselineData: { habitat: "coastal belt", species: ["Casuarina", "Prosopis"], baselineCarbon_tCO2e: 890 },
    status: "ACTIVE",
    createdAt: now, updatedAt: now
  }
])
```
## Users :

```mongoshell
use sih2025
var now = new Date();

db.users.insertMany([
  {
    name: "Rohan Kulkarni",
    email: "rohan.kulkarni@aarambh.org",
    organization: ObjectId("68ca922e414897cd32ce5f47"), // Aarambh Seva Trust
    role: "ADMIN",
    active: true,
    createdAt: now, updatedAt: now
  },
  {
    name: "Meera Shah",
    email: "meera.shah@jmm.ngo",
    organization: ObjectId("68ca922e414897cd32ce5f49"), // Jagruti Mahila Mandal
    role: "FIELD_AGENT",
    active: true,
    createdAt: now, updatedAt: now
  },
  {
    name: "Kavya Pai",
    email: "kavya.pai@udupi-panchayat.in",
    organization: ObjectId("68ca922e414897cd32ce5f4e"), // Sujal Safai Panchayat, Udupi
    role: "ADMIN",
    active: true,
    createdAt: now, updatedAt: now
  },
  {
    name: "Devendra Patil",
    email: "devendra.patil@gvp-gadchiroli.in",
    organization: ObjectId("68ca922e414897cd32ce5f4c"), // Gram Vikas Panchayat, Gadchiroli
    role: "VERIFIER",
    active: true,
    createdAt: now, updatedAt: now
  },
  {
    name: "Anil Reddy",
    email: "anil.reddy@annapurna.org",
    organization: ObjectId("68ca922e414897cd32ce5f48"), // Annapurna Foundation
    role: "FIELD_AGENT",
    active: false,
    createdAt: now, updatedAt: now
  }
])
```