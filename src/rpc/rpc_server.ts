import * as amqp from 'amqplib';

async function startRpcServer() {
  try {
    const connection = await amqp.connect('amqp://localhost');
    const channel = await connection.createChannel();

    const rpcQueue = 'rpc_queue';

    await channel.assertQueue(rpcQueue, { durable: false });
    channel.prefetch(1);

    console.log('[*] Waiting for RPC requests');

    channel.consume(rpcQueue, async (msg) => {
      if (msg) {
        const content = msg.content.toString();
        console.log(`[x] Received request: ${content}`);

        const response = doSomethingTimeConsuming(content); // Simulated time-consuming task

        channel.sendToQueue(msg.properties.replyTo, Buffer.from(response.toString()), {
          correlationId: msg.properties.correlationId,
        });

        channel.ack(msg);
      }
    });
  } catch (error) {
    console.error('Error occurred:', error);
  }
}

function doSomethingTimeConsuming(content: string): string {
  // Simulated time-consuming task, replace this with your actual processing logic
  return `Processed: ${content.toUpperCase()}`;
}

startRpcServer();
