# historial-ofertas

* Checks for good deals that show up in a price tracker website

Contents
========

* [Why?](#why)
* [Usage](#usage)
* [Deployment](#deployment)

### Why?

I needed a way to:
* Be notified of a post with good deals as soon as they show up
* Avoid having to manually check the site
* Save time to do other stuff :)

### Usage

No AWS Lambda
```
npm run local
```

Using AWS Lambda
```
sam build
sam local invoke
```

### Deployment

> **Warning**
> This requires proper AWS access to deploy using SAM

```
sam deploy
```
