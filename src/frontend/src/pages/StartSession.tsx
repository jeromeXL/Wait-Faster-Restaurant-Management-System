import { useNavigate } from "react-router-dom";
import { getAxios } from "../utils/useAxios";


const StartSession = () => {
    const navigate = useNavigate();

    const startSession = async () =>{
        console.log('Start Session button pressed');

        const token = localStorage.getItem('access_token');
        
        try {
            const response = await fetch('http://localhost:8000/session/start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                navigate("/menu")

            } else {
                console.error('Failed to start session. Status:', response.status);
            }
        } catch (error) {
            console.error('Error starting session: ', error)
        }
    };

    return (
    <div style={{ padding: '20px' }}>
      <button onClick={startSession} style={{ padding: '10px 20px', fontSize: '16px' }}>
        Start Session
      </button>
    </div>
  );
}

export default StartSession