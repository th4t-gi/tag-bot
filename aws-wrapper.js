require("dotenv").config();
const AWS = require("aws-sdk");

const AWSWrapper = class AWSWrapper {
  dynamo;
  table;
  partitionId;
  cache;

  constructor(table, partitionId) {
    this.table = table;
    this.partitionId = partitionId;
    // Update our AWS Connection Details
    AWS.config.update({
      region: process.env.AWS_DEFAULT_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    });
    // Create the service used to connect to DynamoDB
    this.dynamo = new AWS.DynamoDB.DocumentClient();
    this.updateCache()
  }

  getDynamo() {
    return this.dynamo;
  }

  getCache(key) {
    return key ? this.cache[key] : this.cache
  }

  async updateCache() {
    console.log("caching");
    this.scan().then(data => {
      this.cache = data
      console.log("cached", this.cache);
    })
  }

  async get(key) {
    let params = {
      Key: {
        [this.partitionId]: key,
      },
      TableName: this.table,
    };

    return new Promise((resolve, reject) => {
      this.dynamo.get(params).promise().then((res) => {
        resolve(res.Item);
      }).catch(reject);
    });
  }

  async batchGet(...keys) {
    let params = {
      RequestItems: {
        [this.table]: {
          Keys: keys.map(k => ({[this.partitionId]: k}))
        }
      }
    }

    return new Promise((resolve, reject) => {
      this.dynamo.batchGet(params).promise().then((res) => {
        const obj = {}
        res.Responses[this.table].map(v => obj[v.id] = v)
        resolve(obj);
      }).catch(reject);
    });
  }

  async set(key, obj) {
    let params = {
      Item: {
        [this.partitionId]: key,
        ...obj,
      },
      TableName: this.table,
      ReturnValues: "ALL_OLD",
    };
    console.info("Set " + key + " to:", obj)
    return new Promise((resolve, reject) => {
      this.dynamo.put(params).promise().then((res) => {
        resolve(res.Attributes);
        this.updateCache()
      }).catch(reject);
    });
  }

  async delete(key) {
    let params = {
      Key: {
        [this.partitionId]: key
      },
      TableName: this.table,
      ReturnValues: "ALL_OLD"
    };
    console.log("Deleting " + key);
    return new Promise((resolve, reject) => {
      this.dynamo.delete(params).promise().then(res => {
        resolve(res.Attributes)
        this.updateCache()
      }).catch(reject)
    })
  }

  async scan() {
    let params = {
      TableName: this.table
    }
    return new Promise(async (resolve, reject) => {
      const res = await this.dynamo.scan(params).promise().catch(reject)
      let obj = {};
      res.Items.map(v => {obj[v.id] = v})
      resolve(obj)
    })
  }

  async update(key, obj) {
    const item = await this.get(key)
    await this.set(key, {...item, ...obj})
    return {...item, ...obj}
  }

  async clear() {
    await this.scan().then(async data => {
      for (const key in data) {
        this.delete(key)
      }
    })
  }


};

// const wrapper = new AWSWrapper("tag-game", "id");
// const devWrapper = new AWSWrapper("dev-tag-game", "id");

// console.log(wrapper.getDocClient());
// wrapper.get("current").then(console.log);
// wrapper.set("1", { time: 20, times_tagged: 0, name: "asdf" })
// wrapper.set("current", { last_tag: 0, user_id: "0", last_tag_msg: "0" })
// wrapper.set("standings", {msg_id: "0", channel: "0"})
// wrapper.update("12345", {times_tagged: 6})

// devWrapper.set("1", {a: 2, b: 4})
// devWrapper.batchGet("current", "1").then(console.log)
// wrapper.scan().then(async data => {
//   console.log(data);
//   wrapper.clear().then(_ => {
//     wrapper.scan().then(console.log)
//   })
// })

// devWrapper.clear()
// wrapper.get("2").then(console.log)
// wrapper.delete("12435")
// wrapper.scan().then(console.log)

module.exports = { AWSWrapper };
