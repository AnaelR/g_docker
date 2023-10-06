const formValidator = require('./form_validator');
const photoModel = require('./photo_model');
const publishMessage = require('./publish_message')
const { Storage } = require('@google-cloud/storage');
const moment = require('moment')
const registeredTags = require('./registered_tags')

const store = new registeredTags()

let storage = new Storage();

async function route(app) {
  app.get('/', async (req, res) => {
    const tags = req.query.tags;
    const tagmode = req.query.tagmode;

    const options = {
      action: 'read',
      expires: moment().add(2, 'days').unix() * 1000
    };

    let signedUrls
    if (store.tags.includes(tags)) {

      signedUrls = await storage
        .bucket('dmii2023bucket')
        .file('public/users/anael-' + tags + '.zip')
        .getSignedUrl(options)

    }

    const ejsLocalVariables = {
      tagsParameter: tags || '',
      tagmodeParameter: tagmode || '',
      photos: [],
      searchResults: false,
      invalidParameters: false,
      downloadUrl: signedUrls || ''
    };


    // if no input params are passed in then render the view with out querying the api
    if (!tags && !tagmode) {
      return res.render('index', ejsLocalVariables);
    }

    // validate query parameters
    if (!formValidator.hasValidFlickrAPIParams(tags, tagmode)) {
      ejsLocalVariables.invalidParameters = true;
      return res.render('index', ejsLocalVariables);
    }

    // get photos from flickr public feed api
    return photoModel
      .getFlickrPhotos(tags, tagmode)
      .then(photos => {
        ejsLocalVariables.photos = photos;
        ejsLocalVariables.searchResults = true;
        return res.render('index', ejsLocalVariables);
      })
      .catch(error => {
        return res.status(500).send({ error });
      });
  });

  app.post('/zip', function (req, res) {
    publishMessage.main('dmii2-6', JSON.stringify(req.body))
    res.send('ok')
  });
}

module.exports = route;
