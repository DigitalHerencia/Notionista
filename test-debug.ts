import { ProjectRepository } from './src/domain/repositories/project.repository.js';
import { MockMcpClient } from './src/mcp/client.js';

async function main() {
  const client = new MockMcpClient();
  const repository = new ProjectRepository(client);

  console.log('Creating projects...');
  const project1 = await repository.create({ name: 'Active Project', status: 'Active' });
  const project2 = await repository.create({ name: 'Completed Project', status: 'Completed' });

  console.log('Executing creates...');
  const created1 = await repository.executeCreate(project1);
  const created2 = await repository.executeCreate(project2);

  console.log('Created project 1:', JSON.stringify(created1, null, 2));
  console.log('Created project 2:', JSON.stringify(created2, null, 2));

  console.log('\nQuerying for active projects...');
  const activeProjects = await repository.findByStatus('Active');

  console.log('Found active projects:', activeProjects.length);
  console.log('Active projects:', JSON.stringify(activeProjects, null, 2));

  console.log('\nQuerying all projects...');
  const allProjects = await repository.findMany();
  console.log('Found all projects:', allProjects.length);
  console.log('All projects:', JSON.stringify(allProjects, null, 2));
}

main().catch(console.error);
