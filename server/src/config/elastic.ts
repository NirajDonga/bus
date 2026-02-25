import { Client } from '@elastic/elasticsearch'


export const elasticClient = new Client({
    node: process.env.ELASTIC_URL || "http://localhost:9200",
})

export async function testElasticConnection() {
    try {
        const info = await elasticClient.info();
        console.log("Successfully connected to Elasticsearch:");
        console.log(`Cluster Name: ${info.cluster_name}`);
        console.log(`Version: ${info.version.number}`);
    } catch (error) {
        console.error("Failed to connect to Elasticsearch:", error);
    }
}