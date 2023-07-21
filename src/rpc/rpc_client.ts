import * as amqp from 'amqplib';

async function rpcClient() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const rpcQueue = 'rpc_queue';
    const correlationId = generateUuid();
    const responseQueue = await channel.assertQueue('', { exclusive: true });

    console.log('[x] Sending RPC request');

    channel.consume(
      responseQueue.queue,
      (msg) => {
        if (msg && msg.properties.correlationId === correlationId) {
          console.log(`[x] Received response: ${msg.content.toString()}`);
          setTimeout(() => {
            connection.close();
            process.exit(0);
          }, 500);
        }
      },
      { noAck: true }
    );

    const content = 'hello';
    channel.sendToQueue(rpcQueue, Buffer.from(content), {
      correlationId,
      replyTo: responseQueue.queue,
    });
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

function generateUuid() {
  return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

rpcClient();
