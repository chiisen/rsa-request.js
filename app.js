const mysql = require("./mysql/sync-mysql")
const rsa = require("./rsa/rsa")
const fetch = require("sync-fetch")
const token = require("./token")
const { inspect } = require("util")

const dc = "I8"
const actionNumber = 99
function main() {
  const action = require("./action/" + actionNumber)
  const { rawData } = action

  const ts = new Date().getTime().toString()
  const secureKey = mysql.secureKey(dc)
  const secureToken = token.secureToken(dc, ts, secureKey[0].SecureKey)

  const x = {
    ts,
    secureToken,
    ...rawData,
  }

  const results = mysql.rsaKey(dc)

  const encrypt = rsa.encrypt(results[0].PublicKey, x)

  const decrypt = rsa.decrypt(results[0].PrivateKey, encrypt)
  console.log("RSA 解密:\n" + inspect(decrypt) + "\n")

  const payload = { dc, x: encrypt }

  const res = fetch("http://127.0.0.1:8083/apiRequest", {
    method: "post",
    body: JSON.stringify(payload),
    headers: { "Content-Type": "application/json" },
  }).json()

  console.log(JSON.stringify(res))
}

main()
