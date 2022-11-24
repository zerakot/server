const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({origin: ['http://localhost:3000']}));

app.listen(3001, () => {
	console.log('Listening on 3001');
});

const baseURL = 'https://faceapidemo-wiktor.cognitiveservices.azure.com';
const subscriptionKey = '97841ac35f194ba3bfbed4ad01bb60b5';
const faceAttributes = 'headPose';
const detectionModel = 'detection_01';

const detectInstance = axios.create({
	baseURL: baseURL,
	timeout: 5000,
	headers: {
		'Ocp-Apim-Subscription-Key': subscriptionKey,
		'Content-Type': 'application/octet-stream',
	},
	params: {
		overload: 'stream',
		returnFaceId: false,
		returnFaceLandmarks: false,
		returnFaceAttributes: faceAttributes,
		detectionModel: detectionModel,
	},
});

app.post('/detect', async (req, res) => {
	const imageDataUrl = req.body.imageDataUrl;
	const imageBuffer = Buffer.from(imageDataUrl.split(',')[1], 'base64');

	try {
		detectInstance.post('/face/v1.0/detect', imageBuffer).then((faceData) => {
			console.log(faceData.data);
			if (faceData !== undefined) {
				if (faceData.data.length === 0) {
					res.status(200).json({status: 'noFaceDetected', pitch: false});
					return;
				}

				const pitch = faceData.data[0].faceAttributes.headPose.pitch;
				res.status(200).json({status: 'faceDetected', pitch: pitch});
			}
		});
	} catch {
		res.status(500).json({status: 'connectionError'});
	}
});
