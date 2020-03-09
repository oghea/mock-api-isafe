const router = require('koa-router')();
const homeController = require(`controller/home`);


router.get('/', homeController.getApiInfo);
router.post('/', homeController.getApiInfo);

//Authentication
router.post('/signIn', homeController.SignIn);

module.exports = router;