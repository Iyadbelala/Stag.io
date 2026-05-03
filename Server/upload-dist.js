import ftp from "basic-ftp";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const password = process.env.FTP_PASSWORD;
if (!password) {
  console.error("Set $env:FTP_PASSWORD first");
  process.exit(1);
}

const client = new ftp.Client();
client.ftp.verbose = true;

try {
  await client.access({
    host: "win1005.site4now.net",
    user: "charafeddin25-001",
    password,
    secure: false,
  });

  await client.cd("site1");
  console.log("In:", await client.pwd());

  console.log("Uploading dist/ to /site1/dist ...");
  await client.ensureDir("dist");
  await client.clearWorkingDir();
  await client.cd("..");
  await client.uploadFromDir(path.join(__dirname, "dist"), "dist");

  console.log("\n--- Final listing of /site1 ---");
  (await client.list()).forEach((f) => console.log("  ", f.name, f.isDirectory ? "<DIR>" : ""));

  console.log("\n--- /site1/dist listing ---");
  (await client.list("dist")).forEach((f) => console.log("  ", f.name, f.isDirectory ? "<DIR>" : ""));

  console.log("\n✅ dist uploaded successfully!");
} catch (err) {
  console.error("Error:", err);
} finally {
  client.close();
}
