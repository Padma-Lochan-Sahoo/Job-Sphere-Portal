import React, { useEffect, useRef, useState,useContext } from 'react'
import Quill from 'quill'
import { JobCategories, JobLocations } from '../assets/assets'
import axios from 'axios'
import { AppContext } from '../context/AppContext'
import { toast } from 'react-toastify'
import { data } from 'react-router-dom'

const AddJob = () => {

    const [title,setTitle] = useState('')
    const [location,setLocation] = useState('Bangalore')
    const [category,setCategory] = useState('Programming')
    const [level,setLevel] = useState('Beginner level')
    const [salary,setSalary] = useState(0)
    const [loading,setLoading] = useState(false)

    const editorRef = useRef(null)
    const quillRef = useRef(null)
    
    const { backendUrl,companyToken } = useContext(AppContext)

    const onSubmitHandler = async (e) =>{
        e.preventDefault();
        setLoading(true)

        try {
            const description = quillRef.current?.root?.innerHTML || "";
            if (!description.trim()) {
                return toast.error("Job description is required!");
            }

            const { data } = await axios.post(backendUrl+'/api/company/post-job',
                { title , description ,location ,category,level,salary},{
                    headers: { Authorization: `Bearer ${companyToken}` }
                }
            )

            if (!title || !description || !location || !category || !salary) {
                return toast.error("Please fill all the fields!");
            }
            


            if(data.success){
                toast.success(data.message)
                setTitle('')
                setSalary(0)
                quillRef.current.root.innerHTML = ""
            } else {
                toast.error(data.message)
            }
        } catch (error) {
            toast.error(data.message)
        } finally{
            setLoading(false)
        }

    }

    useEffect(() => {
        if (!quillRef.current && editorRef.current) {
            quillRef.current = new Quill(editorRef.current, {
                theme: 'snow'
            });
        }
    }, []);
    

  return (
    <form onSubmit={onSubmitHandler} className='container p-4 flex flex-col w-full gap-3 items-start'>
        <div className='w-full'> 
        <p className='mb-2'>Job Title</p>
        <input type="text" placeholder='Type here'
        onChange={e => setTitle(e.target.value)}
        value={title}
        required
        className='w-full max-w-lg px-3 py-2 border-2 border-gray-300 rounded'
        />
    </div>
    <div className='w-full max-w-lg'>
        <p className='my-2'>Job Description</p>
        <div ref={editorRef}>

        </div>
    </div>
    <div className='flex flex-col sm:flex-row gap-2 w-full sm:gap-8'>
        <div>
            <p className='mb-2'>Job Category</p>
            <input
                        list="jobCategories"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Select or type a category"
                        required
                    />
            <datalist id="jobCategories">
                        {JobCategories.map((category, index) => (
                            <option key={index} value={category} />
                        ))}
                    </datalist>
        </div>

        <div>
            <p className='mb-2'>Job Location</p>
            <input
                        list="jobLocations"
                        className="w-full px-3 py-2 border-2 border-gray-300 rounded"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Select or type a location"
                        required
                    />
                    <datalist id="jobLocations">
                        {JobLocations.map((location, index) => (
                            <option key={index} value={location} />
                        ))}
                    </datalist>
        </div>

        <div>
            <p className='mb-2'>Job Level</p>
            <select 
            className='w-full px-3 py-2 border-2 border-gray-300 rounded'
            onChange={e=> setLevel(e.target.value)}>
                <option value="Beginner Level">Beginner Level</option>
                <option value="Intermediate Level">Intermediate Level</option>
                <option value="Senior Level">Senior Level</option>
            </select>
        </div>
    </div>
    <div>
        <p className='mb-2'>Job Salary</p>
        <input type="Number" placeholder='2500' 
        min={0}
        className='w-full px-3 py-2 border-2 border-gray-300 rounded sm:w-[120px]'
        onChange={e=>setSalary(Number(e.target.value))}
        />
    </div>
    <button
    className='w-28 py-3 mt-4 bg-black text-white rounded flex justify-center items-center'
    >
        {loading ? (
                        <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'>
                        </div>
                    ) : (
                        "ADD"
                    )}
    </button>
    </form>
  )
}

export default AddJob