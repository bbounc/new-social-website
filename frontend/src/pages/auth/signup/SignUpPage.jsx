import { Link } from "react-router-dom";
import { useState } from "react";
import XSvg from "../../../components/svgs/X";
import { MdOutlineMail } from "react-icons/md";
import { FaUser } from "react-icons/fa";
import { MdPassword } from "react-icons/md";
import { MdDriveFileRenameOutline } from "react-icons/md";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    email: "",
    username: "",
    fullName: "",
    password: "",
    politicalAffiliation: "", // Added political affiliation to the form data
  });

  const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
  const queryClient = useQueryClient();

  const { mutate, isError, isPending, error } = useMutation({
    mutationFn: async ({ email, username, fullName, password, politicalAffiliation }) => {
      try {
        const res = await fetch("http://localhost:5002/api/auth/signup"
		, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, username, fullName, password, politicalAffiliation }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to create account");
        console.log(data);
        return data;
      } catch (error) {
        console.error("Error during sign up:", error);
        throw error; // This will trigger the onError callback
      }
    },
    onSuccess: () => {
      toast.success("Account created successfully");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
    },
    onError: (error) => {
      toast.error(`Error: ${error.message}`);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault(); // Prevent page reload
    mutate(formData); // Call the mutation
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev); // Toggle password visibility
  };

  return (
    <div className='max-w-screen-xl mx-auto flex h-screen px-10'>
      <div className='flex-1 hidden lg:flex items-center justify-center'>
        <XSvg className='lg:w-2/3 fill-white' />
      </div>
      <div className='flex-1 flex flex-col justify-center items-center'>
        <form className='lg:w-2/3 mx-auto md:mx-20 flex gap-4 flex-col' onSubmit={handleSubmit}>
          <XSvg className='w-24 lg:hidden fill-white' />
          <h1 className='text-4xl font-extrabold text-white'>Join today.</h1>
          <label className='input input-bordered rounded flex items-center gap-2'>
            <MdOutlineMail />
            <input
              type='email'
              className='grow'
              placeholder='Email'
              name='email'
              onChange={handleInputChange}
              value={formData.email}
            />
          </label>
          <div className='flex gap-4 flex-wrap'>
            <label className='input input-bordered rounded flex items-center gap-2 flex-1'>
              <FaUser />
              <input
                type='text'
                className='grow'
                placeholder='Username'
                name='username'
                onChange={handleInputChange}
                value={formData.username}
              />
            </label>
            <label className='input input-bordered rounded flex items-center gap-2 flex-1'>
              <MdDriveFileRenameOutline />
              <input
                type='text'
                className='grow'
                placeholder='Full Name'
                name='fullName'
                onChange={handleInputChange}
                value={formData.fullName}
              />
            </label>
          </div>

          {/* Password Section with Toggle */}
          <div className='input input-bordered rounded flex items-center gap-2 flex-1'>
            <MdPassword className='text-gray-500' /> {/* Re-added the password icon */}
            <input
              id='password-input'
              type={showPassword ? "text" : "password"} // Toggle between text and password
              className='py-3 ps-4 pe-10 block w-full border-gray-200 rounded-lg text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none'
              placeholder='Enter password'
              name='password'
              onChange={handleInputChange}
              value={formData.password}
            />
            <button
              type='button'
              onClick={togglePasswordVisibility}
              className='flex items-center justify-center px-3 text-gray-400 hover:text-blue-600 focus:outline-none'
            >
              {showPassword ? (
                <svg
                  className='shrink-0 size-3.5'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path
                    className='hs-password-active:block'
                    d='M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z'
                  />
                  <circle
                    className='hs-password-active:block'
                    cx='12'
                    cy='12'
                    r='3'
                  ></circle>
                </svg>
              ) : (
                <svg
                  className='hs-password-active:hidden'
                  width='24'
                  height='24'
                  viewBox='0 0 24 24'
                  fill='none'
                  stroke='currentColor'
                  strokeWidth='2'
                  strokeLinecap='round'
                  strokeLinejoin='round'
                >
                  <path
                    className='hs-password-active:hidden'
                    d='M9.88 9.88a3 3 0 1 0 4.24 4.24'
                  ></path>
                  <path
                    className='hs-password-active:hidden'
                    d='M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68'
                  ></path>
                  <path
                    className='hs-password-active:hidden'
                    d='M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61'
                  ></path>
                  <line
                    className='hs-password-active:hidden'
                    x1='2'
                    x2='22'
                    y1='2'
                    y2='22'
                  ></line>
                </svg>
              )}
            </button>
          </div>

          {/* Political Affiliation Dropdown */}
          <label className='input input-bordered rounded flex items-center gap-2'>
            <select
              name='politicalAffiliation'
              className='grow'
              onChange={handleInputChange}
              value={formData.politicalAffiliation}
            >
              <option value='' disabled>Select Your Political Affiliation *</option>
              <option value='liberal'>Liberal</option>
              <option value='conservative'>Conservative</option>
              <option value='other'>Other</option>
            </select>
          </label>

          <button className='btn rounded-full btn-primary text-white'>
            {isPending ? "Loading..." : "Sign up"}
          </button>
          {isError && <p className='text-red-500'>{error.message}</p>}
        </form>
        <div className='flex flex-col lg:w-2/3 gap-2 mt-4'>
          <p className='text-white text-lg'>Already have an account?</p>
          <Link to='/login'>
            <button className='btn rounded-full btn-primary text-white btn-outline w-full'>
              Sign in
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;
