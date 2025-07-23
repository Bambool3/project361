import { Prisma, PrismaClient } from "@/generated/prisma";

export default async function page() {
    const p = new PrismaClient;

    const users = await  p.user.findMany()
    return (
        <div>
            <h1>Users</h1>
            {users.map((user) => (
                <div key={user.id}> 
                    <h2>User ID: {user.id}</h2>
                    <p>Username: {user.username}</p>

                </div>
            ))}
        </div>
    );
    
}