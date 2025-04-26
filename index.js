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

app.post('/api/programs', async (req, res) => {
  try {
    const newProgram = await prisma.program.create({
      data: req.body
    });
    res.json(newProgram);
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: 'Failed to create program' });
  }
});

app.post('/api/clients', async (req, res) => {
  try {
    const clientId = `CL-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`;
    
    const newClient = await prisma.client.create({
      data: {
        ...req.body,
        clientId
      }
    });
    res.json(newClient);
  } catch (err) {
    res.status(500).send('Server error');
  }
});

app.post('/api/enrollments', async (req, res) => {
  try {
    const enrollment = await prisma.enrollment.create({
      data: req.body
    });
    res.json(enrollment);
  } catch (err) {
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

app.get('/api/clients', async (req, res) => {
  try {
    const clients = await prisma.client.findMany({
      select: {
        id: true,
        clientId: true,
        name: true,
        email: true,
        phone: true,
        age: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.json(clients || []);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.get('/api/programs', async (req, res) => {
  try {
    const programs = await prisma.program.findMany();
    res.json(programs);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.get('/api/reports/enrollments', async (req, res) => {
  try {
    const stats = await prisma.program.findMany({
      include: {
        _count: {
          select: { enrollments: true }
        },
        enrollments: {
          select: {
            status: true
          }
        }
      }
    });

    const formattedStats = stats.map(program => ({
      programId: program.id,
      programName: program.name,
      totalEnrollments: program._count.enrollments,
      activeEnrollments: program.enrollments.filter(e => e.status === 'Active').length,
      completedEnrollments: program.enrollments.filter(e => e.status === 'Completed').length
    }));

    res.json(formattedStats);
  } catch (err) {
    console.error(err);
    res.status(500).json([]);
  }
});

app.get('/api/reports/demographics', async (req, res) => {
  try {
    const clients = await prisma.client.findMany();
    
    const report = {
      totalClients: clients.length,
      byGender: clients.reduce((acc, client) => {
        const gender = client.gender || 'Unknown';
        acc[gender] = (acc[gender] || 0) + 1;
        return acc;
      }, {}),
      byAgeGroup: clients.reduce((acc, client) => {
        const age = client.age || 0;
        const group = age < 18 ? '0-17' : 
                     age < 30 ? '18-29' : 
                     age < 50 ? '30-49' : '50+';
        acc[group] = (acc[group] || 0) + 1;
        return acc;
      }, {})
    };
    
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).json({});
  }
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});