import mongoose, { model, Schema } from "mongoose"

const categorySchema = new Schema({
    name: {type: String, required: true, trim: true},
    type: {type: String, enum: ["product", "service"], required: true},
    slug: {type: String, required: true, trim: true},
    slugPath: {type: String, required: true, index: true, unique: true},
    parent: {type: Schema.Types.ObjectId, ref: "category", default: null, index: true},
    ancestors: [{type: Schema.Types.ObjectId, ref: "category", index: true}],
    isActive: {type: Boolean, default: true, index: true}
},
{timestamps: true}
);

function toSlug(s) {
    return String(s)
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-\/]+/g, '')
    .replace(/\-\-+/g, "-")
}

categorySchema.pre("validate", async function (next) {
    this.slug = toSlug(this.slug);

    if(!this.parent) {
        this.ancestors = [];
        this.slugPath = `${this.type}/${this.slug}`
        return;
    }

    const parent = await mongoose.model('category').findById(this.parent).select("slugPath ancestors type");
    
    if(!parent) throw Error("parent category not found");
    if(this.type !== parent.type) throw Error("category type should match parent type");

    this.ancestors = [...(parent.ancestors || []), parent._id];
    this.slugPath = `${parent.slugPath}/${this.slug}`
})

categorySchema.index({type: 1, slugPath: 1}, {uniqye: true});
export default mongoose.model('Category', categorySchema);