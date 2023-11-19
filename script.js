const express = require('express');
const cors = require('cors');
const dns = require('dns');
const mongoose = require('mongoose');
const urlParser = require('url');
require('dotenv').config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const urlSchema = new mongoose.Schema({
	original_url: String,
	short_url: Number
});

const urlModel = mongoose.model('urls', urlSchema);

const app = express();

app.use(cors({ optionsSuccessStatus: 200 }));

app.use(express.json());

app.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname));

app.post('/api/shorturl', (req, res) => {
	const url = req.body.url;

	dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
		if (!address) {
			res.json({ error: 'invalid url' });
		} else {
			const obj = {
				original_url: req.body.url,
				short_url: await urlModel.countDocuments({})
			};

			const newUrl = new urlModel(obj);

			await newUrl.save();

			res.json(obj);
		}
	})
})

app.get('/api/shorturl/:short_url', async (req, res) => {
	const short_url = req.params.short_url;

	const url = await urlModel.findOne({ short_url: short_url });

	res.redirect(url.original_url);
})

app.listen(3000, () => {
	console.log('Your app is listening on port 3000');
});
