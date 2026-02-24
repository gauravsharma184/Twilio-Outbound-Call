# Twilio Outbound Real Time Communication Dialer

## Description
This project allows you to make an outbound call to any number using your own browser.

** Built With **
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [Vanilla JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [Node.js](https://nodejs.org/docs/latest/api/)
- [Express.js](https://expressjs.com/)
- [Twilio](https://www.twilio.com/docs)

## Installation
1. Clone the directory
```console
git clone https://github.com/gauravsharma184/Twilio-Outbound-Call
```
2. Install packages with
```console
npm install
```
3. Start the server
```console
npm start
```
4. Expose the server to the public internet
```console
ngrok http 3000
```

## Build an Image Using Dockerfile
1. Enusre you have docker desktop running on the system
2. Navigate to the project directory where the dockerfile exits.
3. Build the image from the dockerfile using the following command
```console
docker build -t image-name:tag
```
4. Verify the image creation by listing your local images
```console
docker images
```
5. Test the image by running a container from it
```console
docker run -p host-port:container-port image-name:tag
```




