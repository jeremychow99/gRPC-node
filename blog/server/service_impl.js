const grpc = require('@grpc/grpc-js')
const { Empty } = require('google-protobuf/google/protobuf/empty_pb')
const { ObjectId } = require('mongodb')
const { Blog, BlogId } = require('../proto/blog_pb')
function blogToDocument(blog) {
    return {
        author_id: blog.getAuthorId(),
        title: blog.getTitle(),
        content: blog.getContent()
    }
}


// to call the callback provided by gRPC
const internal = (err, callback) => callback({
    code: grpc.status.INTERNAL,
    message: err.toString(),
})

// function to check if mongodDB acknowledged our request, will throw error if not
function checkNotAcknowledged(res, callback) {
    if (!res.acknowledged) {
        callback({
            code: grpc.status.INTERNAL,
            message: 'Operation was not acknowledged'
        })
    }
}


function checkOID(id, callback) {
    try {
        return new ObjectId(id)

    } catch (err) {
        callback({
            code: grpc.status.INTERNAL,
            message: 'Invalid OID'
        })
    }
}

function checkNotFound(res, callback) {
    if (!res || res.matchedCount == 0 || res.deletedCount == 0) {
        callback({
            code: grpc.status.NOT_FOUND,
            message: 'Cound not find blog',
        })
    }
}

function documentToBlog(doc) {
    return new Blog()
        .setId(doc._id.toString())
        .setAuthorId(doc.author_id)
        .setTitle(doc.title)
        .setContent(doc.content)
}


exports.createBlog = async (call, callback) => {
    const data = blogToDocument(call.request)

    // mongoDB add to database
    await collection.insertOne(data).then((res) => {
        checkNotAcknowledged(res, callback)

        // this part is to send back a response to the client
        const id = res.insertedId.toString()
        const blogId = new BlogId().setId(id)

        callback(null, blogId)
    }) //catching the error, call internal function
        .catch((err) => internal(err, callback))
}


exports.readBlog = async (call, callback) => {
    const oid = checkOID(call.request.getId(), callback)

    await collection.findOne({ _id: oid }).then((res) => {
        checkNotFound(res, callback)
        callback(null, documentToBlog(res))
    }).catch((err) => internal(err, callback))
}

exports.updateBlog = async (call, callback) => {
    const oid = checkOID(call.request.getId(), callback)

    await collection.updateOne(
        { _id: oid },
        { $set: blogToDocument(call.request) }
    ).then((res) => {
        checkNotFound(res, callback)
        checkNotAcknowledged(res, callback)
        callback(null, new Empty())
    }).catch((err) => internal(err, callback))
}

exports.listBlogs = async (call, callback) => {
    await collection.find()
        .map((doc) => documentToBlog(doc))
        // server streaming
        .forEach((blog) => call.write(blog))
        .then(() => call.end())
        .catch((err) => call.destroy({
            code: grpc.status.INTERNAL,
            message: 'Could not list blogs',
        }))
}

exports.deleteBlog = async(call, callback) => {
    const oid = checkOID(call.request.getId(), callback)
    //.then() method of a Promise object takes up to two arguments: callback functions for the fulfilled and rejected cases of the Promise. 
    //It immediately returns an equivalent Promise object, allowing you to chain calls to other promise methods.
    await collection.deleteOne({_id: oid}).then((res) => {
        console.log(res);
        checkNotFound(res, callback)
        checkNotAcknowledged(res, callback)
        callback(null , new Empty())
    }).catch((err) => internal(err, callback))
}