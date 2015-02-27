class Notification
  include MongoMapper::EmbeddedDocument

  key :receiver, ObjectId
  key :resource, ObjectId, required: true
  key :action, String, required: true
  embedded_in :user
end
