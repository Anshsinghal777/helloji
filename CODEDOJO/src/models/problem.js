
import mongoose from 'mongoose';
import { Schema } from 'mongoose';
const problemSchema = new Schema({
    title: {
        type: String,
        required : true,

    },
    description: {
        type: String,
        required : true,

    },
    difficulty : {
        type : String,
        enum : ['easy','medium','hard'],
        required : true,
    },
    tags : {
        type : [String],
        required : true,
         enum : ['arrays','strings','linkedlist','math', 'stack','queue' ,'dynamicprogramming','greedy','trees','graphs','sorting','searching'],

    },
    visibleTestCases : [{
        input : { type : String , required : true },
        output : { type : String , required : true},
        explanation : { type : String }
    }],
     hiddenTestCases : [{
        input : { type : String , required : true },
        output : { type : String , required : true},
        
    }],
twrapp:[{
        // language : { type : String  },

        code : { type : String }
    }],
    bwrapp:[{
        // language : { type : String  },
        code : { type : String }
    }],

    startCode:[{
        language : { type : String , required : true },
        initialCode : { type : String , required : true}
    }],
    referenceSolution : [{
        language : { type : String , required : true },
        completeCode : { type : String , required : true}
    }],
    problemCreator : {
        type : mongoose.Schema.Types.ObjectId,
        ref : 'User',
        required : true,
    }


    } , {timestamps : true});

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
