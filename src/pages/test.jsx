import { div } from 'motion/react-client';
import React from 'react';

function Test(props) {
    return (
        <div className='m-5'>

            <div className='email | flex relative w-fit border-b pb-4 rounded py-1 border-gray-900'>
                <div className='me | relative border-t rounded py-1 border-gray-900'>
                    admin
                    <span className='text-xs bg-indigo-600  text-white rounded absolute -top-5 left-1/2 transform -translate-x-1/2'>me</span>
                </div>

                <div className='social-website | relative flex border-t rounded py-1 border-gray-900'>

                    <div className='website | relative flex border-b rounded py-1 border-gray-900 '>
                        @
                        <div className='social | relative'>
                            Ghaznix
                            <span className='text-xs bg-indigo-600  text-white rounded absolute -bottom-6 left-1/2 transform -translate-x-1/2'>Instagram</span>
                        </div>
                    </div>
                    .com
                    <span className='text-xs bg-indigo-600  text-white rounded absolute -top-5 left-1/2 transform -translate-x-1/2'>website</span>
                </div>
                <span className='text-xs bg-indigo-600  text-white rounded absolute -bottom-5 left-1/2 transform -translate-x-1/2'>Email</span>
            </div>

        </div>
    );
}

export default Test;