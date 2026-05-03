import ftp from "basic-ftp";

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

  // List nested site1
  console.log("\n--- Contents of nested site1/ ---");
  try {
    const nestedItems = await client.list("site1");
    nestedItems.forEach((f) => console.log("  ", f.name, f.isDirectory ? "<DIR>" : ""));
  } catch (e) {
    console.log("Cannot list site1:", e.message);
  }

  // Try to rename/move site1/dist -> dist
  console.log("\n--- Moving site1/dist to dist ---");
  try {
    await client.rename("site1/dist", "dist");
    console.log("Renamed site1/dist -> dist");
  } catch (e) {
    console.log("Rename dist failed:", e.message);
  }

  // Move config files
  for (const file of ["package.json", ".env", "web.config"]) {
    try {
      await client.rename(`site1/${file}`, file);
      console.log(`Renamed site1/${file} -> ${file}`);
    } catch (e) {
      console.log(`Rename ${file} failed:`, e.message);
    }
  }

  // Remove empty nested site1
  try {
    await client.removeDir("site1");
    console.log("Removed nested site1/");
  } catch (e) {
    console.log("Remove site1 failed:", e.message);
  }

  console.log("\n--- Final listing of /site1 ---");
  (await client.list()).forEach((f) => console.log("  ", f.name, f.isDirectory ? "<DIR>" : ""));

} catch (err) {
  console.error("Fatal:", err);
} finally {
  client.close();
}
