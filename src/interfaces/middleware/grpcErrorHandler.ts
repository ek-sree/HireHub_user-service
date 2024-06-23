import * as grpc from '@grpc/grpc-js';

const grpcErrorHandler = (callback: any, error: any) => {
    if (error instanceof Error) {
        callback({
            code: grpc.status.INTERNAL,
            message: error.message,
        }, null);
    } else {
        callback({
            code: grpc.status.INTERNAL,
            message: 'Unknown error occurred',
        }, null);
    }
};

export default grpcErrorHandler;
