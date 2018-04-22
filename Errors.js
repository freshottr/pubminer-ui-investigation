
class ErrorSeverity {
    static get Info() {
        return 2;
    }

    static get Warn() {
        return 1;
    }

    static get Danger() {
        return 0;
    }
}

class AppError extends Error {
    constructor(severity, message, cause) {
        super(message, cause);
        this.name = this.constructor.name;
        this.severity = severity;
        this.cause = cause;
    }
}

class EmptySearchResultError extends AppError {
    constructor(query) {
        super(ErrorSeverity.Info, `No results found for "${query}. Please try another query"`);
    }
}

class InvalidQueryStringError extends AppError {
    constructor(query) {
        super(ErrorSeverity.Warn, `"${query}" is not a valid query string`);
    }
}

class InvalidDocumentFormatError extends AppError {
    constructor(cause) {
        super(ErrorSeverity.Danger, `bad document format`, cause);
    }
}

module.exports = {
    EmptySearchResultError: EmptySearchResultError,
    InvalidQueryStringError: InvalidQueryStringError,
    InvalidDocumentFormatError: InvalidDocumentFormatError,
    Severity: ErrorSeverity
};



