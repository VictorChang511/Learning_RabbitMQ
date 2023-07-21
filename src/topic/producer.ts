import * as amqp from 'amqplib';

async function publishMessage() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchangeName = 'topic_exchange';
    const routingKey1 = 'example.topic.key';
    const routingKey2 = 'key.example.topic';
    const message = 'Hello from the producer!';

    await channel.assertExchange(exchangeName, 'topic', { durable: false });
    channel.publish(exchangeName, routingKey1, Buffer.from(message));
    console.log(`[x] Sent message: ${message}, routingKey: ${routingKey1}`);

    channel.publish(exchangeName, routingKey2, Buffer.from(message));
    console.log(`[x] Sent message: ${message}, routingKey: ${routingKey2}`);

    setTimeout(() => {
      connection.close();
      process.exit(0);
    }, 500);
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

publishMessage();
