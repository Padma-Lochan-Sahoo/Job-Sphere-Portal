import Job from "../models/job.models.js"




// Get all Jobs
export const getJobs = async (req, res) => {
    try {
        const jobs = await Job.find({ visible: true })
            .populate("companyId", "name image email")

        const validJobs = jobs.filter(job => job.companyId !== null);

        res.json({
            success: true,
            jobs: validJobs
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};



// Get a single job by id
export const getJobById = async (req,res) => {
    try {
        const {id} = req.params
        const job = await Job.findById(id)
        .populate({path:'companyId',select:'-password'})

        if(!job){
            return res.json({
                success: false,
                message: "Job not found"
            })
        }
        res.json({
            success: true,
            job
        })
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}