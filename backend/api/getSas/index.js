const {
  generateBlobSASQueryParameters,
  BlobSASPermissions,
  StorageSharedKeyCredential
} = require("@azure/storage-blob");

module.exports = async function (context, req) {
  try {
    const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
    const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY;
    const containerName = "uploads";
    const blobName = req.query.filename;

    const cred = new StorageSharedKeyCredential(accountName, accountKey);
    const now = new Date();
    const expiry = new Date(now.valueOf() + 60 * 60 * 1000); // 1 hour
    const sasToken = generateBlobSASQueryParameters({
      containerName,
      blobName,
      permissions: BlobSASPermissions.parse("racw"),
      startsOn: now,
      expiresOn: expiry
    }, cred).toString();

    const url = `https://${accountName}.blob.core.windows.net/${containerName}/${blobName}?${sasToken}`;

    context.res = { status: 200, body: { uploadUrl: url } };
  } catch (err) {
    context.res = { status: 500, body: { error: err.message } };
  }
};
