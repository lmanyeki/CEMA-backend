const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');

const app = express();
const prisma = new PrismaClient();

app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://cema-frontend-phi.vercel.app/'
  ]
}));
app.use(express.json());

app.post('/programs', async (req, res) => {
  try {
    const { name, description } = req.body;
    const newProgram = await prisma.program.create({
      data: {
        name,
        description
      }
    });
    res.json(newProgram);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/clients', async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    const newClient = await prisma.client.create({
      data: {
        name,
        email,
        phone
      }
    });
    res.json(newClient);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.post('/enroll', async (req, res) => {
  try {
    const { clientId, programId } = req.body;
    const enrollment = await prisma.enrollment.create({
      data: {
        clientId: parseInt(clientId),
        programId: parseInt(programId)
      }
    });
    res.json(enrollment);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/clients/search', async (req, res) => {
  try {
    const { query } = req.query;
    const clients = await prisma.client.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      }
    });
    res.json(clients);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

app.get('/clients/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const client = await prisma.client.findUnique({
      where: { id: parseInt(id) },
      include: {
        enrollments: {
          include: {
            program: true
          }
        }
      }
    });
    
    if (!client) {
      return res.status(404).send('Client not found');
    }
    
    const response = {
      client,
      programs: client.enrollments.map(e => e.program)
    };
    
    res.json(response);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});