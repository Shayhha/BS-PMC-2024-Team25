import React, { useState, useEffect, useRef } from 'react';
import './EditUser.css';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa'; 

function EditUser() {
    // useStates //
    const [oldData, setOldData] = useState({
        userName: '',
        fName: '',
        lName: '',
        email: ''
    });

    const [leftFormData, setleftFormData] = useState({
        userName: '',
        fName: '',
        lName: '',
        userType: ''
    });

    const [emailData, setEmailData] = useState({
        email: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: ''
    });

    // this is for error messages //
    const [userNameError, setUserNameError] = useState('');
    const [fNameError, setFNameError] = useState('');
    const [lNameError, setLNameError] = useState('');
    const [emailError, setEmailError] = useState('');
    const [passwordError, setPasswordError] = useState('');

    // this is for password eye icon //
    const inputRef = useRef(null);
    const [isOldPasswordVisible, setIsOldPasswordVisible] = useState(false);
    const toggleOldPasswordVisibility = () => {
        setIsOldPasswordVisible(!isOldPasswordVisible);
        setTimeout(() => {
            inputRef.current.focus(); //set focus to current textbox
        }, 0);
    };

    const [isNewPasswordVisible, setIsNewPasswordVisible] = useState(false);
    const toggleNewPasswordVisibility = () => {
        setIsNewPasswordVisible(!isNewPasswordVisible);
        setTimeout(() => {
            inputRef.current.focus(); //set focus to current textbox
        }, 0);
    };

    // useEffect for page refresh initialize
    useEffect(() => {
        // Fetch user data on component mount
        const fetchUserData = async () => {
            try {
                const response = await axios.get('http://127.0.0.1:8090/userSettings/getUser'); 
                setleftFormData(response.data);
                setEmailData(response.data);
                setOldData(response.data); //set old data
            } catch (error) {
                console.error('Error fetching user data:', error);
                alert(`Error fetching user data: ${error.response.data.error}`);
            }
        };
        fetchUserData();
    }, []);

    // handleChange for leftFormData
    const handleLeftChange = (e) => {
        const { name, value } = e.target;
        setleftFormData(prevState => ({
            ...prevState,
            [name]: value
        }));

        //validate the input as the user types
        switch (name) {
            case 'userName':
                if (/^[a-zA-Z0-9]*$/.test(value)) {
                    setUserNameError('');
                } else {
                    setUserNameError('Username must contain only letters and numbers.');
                }
                break;
            case 'fName':
                if (/^[a-zA-Z]*$/.test(value)) {
                    setFNameError('');
                } else {
                    setFNameError('First name must contain only letters.');
                }
                break;
            case 'lName':
                if (/^[a-zA-Z]*$/.test(value)) {
                    setLNameError('');
                } else {
                    setLNameError('Last name must contain only letters.');
                }
                break;
            default:
                break;
        }
    };

    //handle function for submit changes of leftFormData
    const handleLeftSubmit = async (e) => {
        e.preventDefault();

        //check if values were changed, if remained the same we return
        if (oldData.userName === leftFormData.userName && oldData.fName === leftFormData.fName
            && oldData.lName === leftFormData.lName) {
            return;
        }

        if (userNameError !== '' || fNameError !== '' || lNameError !== '') {
            console.log('Invalid user info parameters.');
            alert(`Invalid user info parameters.`);
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8090/userSettings/changeUserInfo', leftFormData);
            setOldData(leftFormData); //set our oldData to be newly set data
            console.log('User info updated successfully:', response.data);
            alert(`User info updated successfully.`);
        } 
        catch (error) {
            alert(`Error updating user info: ${error.response.data.error}`);
        }
    };

    //handle rightEmailChange for emailForm
    const handleRightEmailChange = (e) => {
        const { name, value } = e.target;
        setEmailData(prevState => ({
            ...prevState,
            [name]: value
        }));

        //validate email
        if (/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(value)) {
            setEmailError('');
        } else {
            setEmailError('Invalid email format.');
        }
    };

    //handle function for submit changes of emailForm
    const handleRightEmailSubmit = async (e) => {
        e.preventDefault();

        if (emailError !== '') {
            alert(`Invalid email format.`);
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8090/userSettings/changeEmail', { newEmail: emailData.email });
            setOldData(prevState => ({ ...prevState, email: emailData.email })); // Update oldData with new email
            console.log('User email updated successfully:', response.data);
            alert(`User email updated successfully.`);
        } catch (error) {
            alert(`Error updating user email: ${error.response.data.error}`);
        }
    };

    //handle rightPasswordChange for passwordForm
    const handleRightPasswordChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prevState => ({
            ...prevState,
            [name]: value
        }));

        //validate password form
        if (/^(?=.*[A-Z])[^\s'=]{6,24}$/.test(value)) {
            setPasswordError('');
        } else {
            setPasswordError('Invalid password format, password should include at least 6 characters and at least one capital letter.');
        }
    };

    //handle function for submit changes of passwordForm
    const handleRightPasswordSubmit = async (e) => {
        e.preventDefault();

        if (passwordError !== '') {
            alert(`Invalid password format, please provide a valid password that matches requirements.`);
            return;
        }

        try {
            const response = await axios.post('http://127.0.0.1:8090/userSettings/changePassword', passwordData);
            console.log('User password updated successfully:', response.data);
            alert(`User password updated successfully.`);
            //clear password fields after successful submission
            setPasswordData(prevState => ({
                ...prevState,
                oldPassword: '',
                newPassword: ''
            }));
        } 
        catch (error) {
            alert(`Error updating user password: ${error.response.data.error}`);
        }
    };
    
    return (
        <div className="edit_user_page">
            <h1 className="edit_user_title">Edit User - {leftFormData.userType}</h1>
            <div className="edit_user_container">
                {/* Left side */}
                <div className="edit_user_form_left">
                    <form className="edit_user_form" onSubmit={handleLeftSubmit}>
                        <label>
                            Username:
                            <input type="text" name="userName" value={leftFormData.userName} onChange={handleLeftChange} data-testid="cypress-edituser-username-input" required/>
                            {userNameError && <span style={{ color: 'red' }}>{userNameError}</span>}
                        </label>
                        <label>
                            First Name:
                            <input type="text" name="fName" value={leftFormData.fName} onChange={handleLeftChange} required/>
                            {fNameError && <span style={{ color: 'red' }}>{fNameError}</span>}
                        </label>
                        <label>
                            Last Name:
                            <input type="text" name="lName" value={leftFormData.lName} onChange={handleLeftChange} required/>
                            {lNameError && <span style={{ color: 'red' }}>{lNameError}</span>}
                        </label>
                        <button type="submit" className="edit_user_submit_button" data-testid="cypress-edituser-username-submit-button">Submit</button>
                    </form>
                </div>

                {/* Right side */}
                <div className="edit_user_form_right">
                    <form className="edit_user_form" onSubmit={handleRightEmailSubmit}>
                        <label>
                            Email:
                            <input type="email" name="email" value={emailData.email} onChange={handleRightEmailChange} data-testid="cypress-edituser-email-input" required/>
                            {emailError && <span style={{ color: 'red' }}>{emailError}</span>}
                        </label>
                        <button type="submit" className="edit_user_submit_button" data-testid="cypress-edituser-email-submit-button">Submit Email</button>
                    </form>
                    <form className="edit_user_form" onSubmit={handleRightPasswordSubmit}>
                        <label>
                            Old Password:
                            <div className="oldPassword-input-container" style={{ position: 'relative' }}>
                            <input type={isOldPasswordVisible ? "text" : "password"} name="oldPassword" value={passwordData.oldPassword} onChange={handleRightPasswordChange} maxLength={24} ref={inputRef} required/>
                            <span onClick={toggleOldPasswordVisibility}style={{position: 'absolute',right: '18px',top: '40%',transform: 'translateY(-50%)',cursor: 'pointer'}}>{isOldPasswordVisible ? <FaEyeSlash size={25}/> : <FaEye size={25}/>}</span>
                            </div>
                            New Password:
                            <div className="newPassword-input-container" style={{ position: 'relative' }}>
                            <input type={isNewPasswordVisible ? "text" : "password"} name="newPassword" value={passwordData.newPassword} onChange={handleRightPasswordChange} maxLength={24} ref={inputRef} required/>
                            <span onClick={toggleNewPasswordVisibility}style={{position: 'absolute',right: '18px',top: '40%',transform: 'translateY(-50%)',cursor: 'pointer'}}>{isNewPasswordVisible ? <FaEyeSlash size={25}/> : <FaEye size={25}/>}</span>
                            </div>
                            {passwordError && <span style={{ color: 'red' }}>{passwordError}</span>}
                        </label>
                        <button type="submit" className="edit_user_submit_button">Submit Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default EditUser;
