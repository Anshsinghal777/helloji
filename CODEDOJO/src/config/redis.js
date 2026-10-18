





import { createClient } from 'redis';

const redisClient =  createClient({
    username: 'default',
    password: 'dZtDITz8O3cU8G7A4c1YB5NjxEOy0fDd',
    socket: {
        host: 'redis-10785.crce179.ap-south-1-1.ec2.cloud.redislabs.com',
        port: 10785
    }
});

redisClient.on('error', err => console.log('Redis Client Error', err));

export default redisClient;





// import { createClient } from 'redis';

// const client = createClient({
//     username: 'default',
//     password: 'dZtDITz8O3cU8G7A4c1YB5NjxEOy0fDd',
//     socket: {
//         host: 'redis-10785.crce179.ap-south-1-1.ec2.cloud.redislabs.com',
//         port: 10785
//     }
// });

// client.on('error', err => console.log('Redis Client Error', err));

// await client.connect();

// await client.set('foo', 'bar');
// const result = await client.get('foo');
// console.log(result)  // >>> bar
