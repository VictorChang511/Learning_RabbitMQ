import * as amqp from 'amqplib';

async function consumeMessage() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const exchangeName = 'topic_exchange';
    const bindingKey1 = 'example.topic.*';
    const bindingKey2 = '*.example.topic';

    await channel.assertExchange(exchangeName, 'topic', { durable: false });

    const queue1 = await channel.assertQueue('', { exclusive: true });
    const queue2 = await channel.assertQueue('', { exclusive: true });
    channel.bindQueue(queue1.queue, exchangeName, bindingKey1);
    channel.bindQueue(queue2.queue, exchangeName, bindingKey2);

    console.log('[*] Waiting for messages. To exit press CTRL+C');

    channel.consume(
      queue1.queue,
      (msg) => {
        if (msg) {
          console.log(`[x] Queue1 received message: ${msg.content.toString()}`);
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
    channel.consume(
      queue2.queue,
      (msg) => {
        if (msg) {
          console.log(`[x] Queue2 received message: ${msg.content.toString()}`);
          channel.ack(msg);
        }
      },
      { noAck: false }
    );
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

consumeMessage();
