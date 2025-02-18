require("dotenv").config();

const express = require('express');
const path = require("path");

const { Provinces, Districts, Sectors, Cells, Villages } = require('rwanda');
const cors = require('cors');

const app = express();
app.use(cors())
app.use(express.json());

const port = process.env.PORT || 4000;

// Serve static files from React build
app.use(express.static(path.join(__dirname, '../client/build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/build/index.html'));
});
app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });


app.get('/provinces', (req, res) => {
    return res.json(
       {
        size: Provinces().length,
        data: Provinces()
       }
    );

});

app.get('/districts', (req, res) => {

    const {province} = req.query;

    return res.json({
        size: Districts(province).length,
        data: Districts(province)
    });
});

app.get('/sectors', (req, res) => {
    const {
        province,
        district
        } = req.query;

    return res.json({
        size: Sectors(province, district).length,
        data: Sectors(province, district)
    });
});


app.get('/cells', (req, res) => {

    const {
        province,
        district,
        sector
    } = req.query;

    return res.json({
        size: Cells(province, district, sector).length,
        data: Cells(province, district, sector)
    });
});


app.get('/villages', (req, res) => {

    const {
        province,
        district,
        sector,
        cell} = req.query;

    return res.json({
        size: Villages(province, district, sector, cell).length,
        data: Villages(province, district, sector, cell)
    }
    );
});


