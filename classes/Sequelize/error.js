// //  处理sequelize error
const errorType = [
    { name: 'SequelizeForeignKeyConstraintError' },
    { name: 'SequelizeAccessDeniedError' },
    { name: 'SequelizeAssociationError' },
    { name: 'SequelizeBulkRecordError' },
    { name: 'SequelizeConnectionError' },
    { name: 'SequelizeConnectionRefusedError' },
    { name: 'SequelizeExclusionConstraintError' },
    { name: 'SequelizeTimeoutError' },
    { name: 'SequelizeUnknownConstraintError' },
    { name: 'SequelizeEagerLoadingError' },
    { name: 'SequelizeEmptyResultError' },
    { name: 'SequelizeHostNotFoundError' },
    { name: 'SequelizeHostNotReachableError' },
    { name: 'SequelizeInstanceError' },
    { name: 'SequelizeInvalidConnectionError' },
    { name: 'SequelizeOptimisticLockError' },
    { name: 'SequelizeQueryError' },
    { name: 'SequelizeScopeError' },
    { name: 'SequelizeUniqueConstraintError' },
    { name: 'SequelizeUnknownConstraintError' },
    { name: 'SequelizeValidationError' },
];

class ValidationErrorItem {
    
}

module.exports = function isSequelizeError(error){
    for(let i of errorType){
        if (error.name === i.name){
            return true;
        }
    }
    return false;
}
