import React, { useState } from "react";
import axios from "axios";

const CreatePost = (props) => {
  const [description, setDescription] = useState("");  // State for description
  const [code, setCode] = useState("");  // State for code
  const [codeExtension, setCodeExtension] = useState("txt");  // State for code extension
  const [file, setFile] = useState(null);  // State for file
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { userId } = props;

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);  // Update file state when a file is selected
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); // Start the loading process

    // Simulate a submit action with a delay (e.g., for API calls)
    setTimeout(() => {
      window.location.reload()
    }, 10);
    // Prepare form data to handle both code and file
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("description", description);
    
    if (code) {
      formData.append("code", code);  // Add code if provided
      formData.append("codeExtension", codeExtension);  // Add code extension if provided
    }
    
    if (file) {
      formData.append("file", file);  // Add file if provided
    }

    try {
      const response = await axios.post("http://localhost:5002/post", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      // console.log(response);
      if (response.status === 201) {
        setMessage("Post created successfully!");
        setDescription(""); 
        setCode(""); 
        setFile(null);  // Reset file input
        setCodeExtension("txt");  // Reset the code extension
      } else {
        setMessage("Failed to create post");
      }
    } catch (error) {
      console.error("Error creating post:", error); 
      setMessage("An error occurred while creating the post");
    }
  };

  return (
    <div>
          <form data-theme="night" 
          onSubmit={handleSubmit}
          className="ml-[30%] p-8 rounded-lg shadow-lg w-full max-w-md space-y-5"
        >
          <h2 className="text-2xl font-semibold text-center text-lime-100">Create a New Post</h2>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Write the description here..."
            required
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none"
            rows="4"
          />

          {/* Code Field */}
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Write your code here (if any)..."
            className="w-full p-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400 resize-none bg-gray-900 text-green-400 font-mono"
            rows="6"
            style={{ fontFamily: "monospace" }}
          />
          <div className="flex items-center space-x-3">
            <label htmlFor="codeExtension" className=" text-lime-100">Extension </label>
            <select
              id="codeExtension"
              value={codeExtension}
              onChange={(e) => setCodeExtension(e.target.value)}
              className="select w-full max-w-xs p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option disabled selected>Extension</option>
              <option value="c">.c</option>
              <option value="cpp">.cpp</option>
              <option value="cs">.cs</option>
              <option value="txt">.txt</option>
              <option value="js">.js</option>
              <option value="py">.py</option>
              <option value="java">.java</option>
              <option value="html">.html</option>
              <option value="css">.css</option>
            </select>
          </div>

          {/* File Input */}
          <input
            type="file"
            className="file-input file-input-bordered file-input-accent w-full max-w-xs border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            onChange={handleFileChange}
          />

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 mt-4 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition duration-300 ease-in-out"
          >
            {loading ? "Posting..." : "Post"}
          </button>
        </form>
    </div>
  );
};

export default CreatePost;
