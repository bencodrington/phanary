db = db.getSiblingDB('phanary')
db.tracks.createIndex({"tags":"text"})
db.tracks.createIndex({"name":1})
db.oneshots.createIndex({"tags":"text"})
db.oneshots.createIndex({"name":1})
db.atmospheres.createIndex({"tags":"text"})
db.atmospheres.createIndex({"name":1})
print("Phanary Database Initialization complete.");
// cursor = db.tracks.find();
// while ( cursor.hasNext() ) {
//    printjson( cursor.next() );
// }