import path from 'path';
import { Service } from 'node-windows';

let service = new Service({
    name: 'Dynmatic Paper Local Server',
    description: 'A local server for dynmatic paper.',
    script: path.resolve('./app.mjs')
});

service.on('install', function () {
    service.start();
});

service.install();