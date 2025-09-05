#!/bin/bash

# Comprehensive Testing Suite for AI Workout Backend Enhancements
# Tests all 5 major enhancements with curl commands

set -e

# Configuration
BASE_URL="http://localhost:3000"
API_BASE="$BASE_URL/v1"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Helper functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

run_test() {
    local test_name="$1"
    local curl_command="$2"
    local expected_status="$3"
    
    ((TOTAL_TESTS++))
    log_info "Running test: $test_name"
    
    # Execute curl command and capture response
    response=$(eval "$curl_command" 2>/dev/null)
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$status_code" = "$expected_status" ]; then
        log_success "$test_name - Status: $status_code"
        echo "Response: $body" | jq '.' 2>/dev/null || echo "Response: $body"
    else
        log_error "$test_name - Expected: $expected_status, Got: $status_code"
        echo "Response: $body"
    fi
    
    echo "----------------------------------------"
}

# Setup test user and authentication
setup_test_user() {
    log_info "Setting up test user..."
    
    # Create test user
    TEST_USER_RESPONSE=$(curl -s -X POST "$API_BASE/users" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "test@aiworkout.com",
            "experience": "intermediate",
            "goals": ["strength", "muscle_gain"],
            "equipmentAvailable": ["dumbbells", "barbell", "bench"],
            "health_ack": true,
            "data_consent": true
        }' \
        -w "\n%{http_code}")
    
    # Extract user ID and create mock auth token
    USER_ID=$(echo "$TEST_USER_RESPONSE" | head -n -1 | jq -r '.user.id' 2>/dev/null || echo "test-user-id")
    AUTH_TOKEN="Bearer mock-jwt-token-for-testing"
    
    log_success "Test user created with ID: $USER_ID"
}

# Test 1: Enhanced Prompt Engineering & Workout Generation
test_enhanced_workout_generation() {
    log_info "=== Testing Enhanced Workout Generation ==="
    
    run_test "Generate Enhanced Workout" \
        "curl -s -X POST '$API_BASE/workouts/generate' \
        -H 'Authorization: $AUTH_TOKEN' \
        -H 'Content-Type: application/json' \
        -d '{
            \"experience\": \"intermediate\",
            \"goals\": [\"strength\", \"muscle_gain\"],
            \"workoutType\": \"upper_body\",
            \"equipmentAvailable\": [\"dumbbells\", \"barbell\", \"bench\"],
            \"duration\": 60,
            \"constraints\": []
        }' \
        -w '\n%{http_code}'" \
        "201"
    
    run_test "Quick Workout Generation" \
        "curl -s -X POST '$API_BASE/workouts/quick-generate' \
        -H 'Authorization: $AUTH_TOKEN' \
        -H 'Content-Type: application/json' \
        -w '\n%{http_code}'" \
        "201"
}

# Test 2: Biometric Integration
test_biometric_integration() {
    log_info "=== Testing Biometric Integration ==="
    
    # Mock biometric data sync
    run_test "Sync Biometric Data" \
        "curl -s -X POST '$API_BASE/integrations/sync' \
        -H 'Authorization: $AUTH_TOKEN' \
        -H 'Content-Type: application/json' \
        -d '{
            \"platforms\": [\"fitbit\", \"apple_health\"],
            \"dataTypes\": [\"heart_rate\", \"sleep\", \"steps\"]
        }' \
        -w '\n%{http_code}'" \
        "200"
    
    run_test "Get Recovery Recommendations" \
        "curl -s -X GET '$API_BASE/recovery/recommendations' \
        -H 'Authorization: $AUTH_TOKEN' \
        -w '\n%{http_code}'" \
        "200"
}

# Test 3: Intelligent Progression
test_intelligent_progression() {
    log_info "=== Testing Intelligent Progression ==="
    
    run_test "Get Progression Recommendations" \
        "curl -s -X GET '$API_BASE/progression/recommendations' \
        -H 'Authorization: $AUTH_TOKEN' \
        -w '\n%{http_code}'" \
        "200"
    
    run_test "Apply Periodization" \
        "curl -s -X POST '$API_BASE/workouts/test-workout-id/periodize' \
        -H 'Authorization: $AUTH_TOKEN' \
        -H 'Content-Type: application/json' \
        -d '{
            \"phase\": \"intensification\",
            \"weekInPhase\": 2
        }' \
        -w '\n%{http_code}'" \
        "200"
}

# Test 4: Real-Time Coaching
test_real_time_coaching() {
    log_info "=== Testing Real-Time Coaching ==="
    
    run_test "Real-Time Performance Analysis" \
        "curl -s -X POST '$API_BASE/coaching/analyze' \
        -H 'Authorization: $AUTH_TOKEN' \
        -H 'Content-Type: application/json' \
        -d '{
            \"sessionId\": \"test-session-id\",
            \"currentExercise\": \"bench_press\",
            \"setNumber\": 2,
            \"repNumber\": 8,
            \"heartRate\": 145,
            \"perceivedExertion\": 7,
            \"formQuality\": 8,
            \"fatigueLevel\": 6
        }' \
        -w '\n%{http_code}'" \
        "200"
    
    run_test "Workout Adaptation" \
        "curl -s -X POST '$API_BASE/workouts/test-workout-id/adapt' \
        -H 'Authorization: $AUTH_TOKEN' \
        -H 'Content-Type: application/json' \
        -d '{
            \"exerciseIndex\": 1,
            \"currentRest\": 90,
            \"formQuality\": 6,
            \"perceivedExertion\": 8,
            \"heartRate\": 155
        }' \
        -w '\n%{http_code}'" \
        "200"
}

# Test 5: Integration Ecosystem
test_integration_ecosystem() {
    log_info "=== Testing Integration Ecosystem ==="
    
    run_test "Setup Integration" \
        "curl -s -X POST '$API_BASE/integrations/setup' \
        -H 'Authorization: $AUTH_TOKEN' \
        -H 'Content-Type: application/json' \
        -d '{
            \"platform\": \"myfitnesspal\",
            \"credentials\": {
                \"accessToken\": \"mock-access-token\",
                \"refreshToken\": \"mock-refresh-token\"
            }
        }' \
        -w '\n%{http_code}'" \
        "200"
    
    run_test "Get Health Insights" \
        "curl -s -X GET '$API_BASE/integrations/insights' \
        -H 'Authorization: $AUTH_TOKEN' \
        -w '\n%{http_code}'" \
        "200"
    
    run_test "Export Workout Data" \
        "curl -s -X POST '$API_BASE/integrations/export' \
        -H 'Authorization: $AUTH_TOKEN' \
        -H 'Content-Type: application/json' \
        -d '{
            \"workoutId\": \"test-workout-id\",
            \"platforms\": [\"strava\", \"apple_health\"]
        }' \
        -w '\n%{http_code}'" \
        "200"
}

# Test 6: Frictionless UX
test_frictionless_ux() {
    log_info "=== Testing Frictionless UX ==="
    
    run_test "Predictive Schedule" \
        "curl -s -X GET '$API_BASE/workouts/predictive-schedule?days=7' \
        -H 'Authorization: $AUTH_TOKEN' \
        -w '\n%{http_code}'" \
        "200"
    
    run_test "Quick Workout Options" \
        "curl -s -X GET '$API_BASE/workouts/quick-options' \
        -H 'Authorization: $AUTH_TOKEN' \
        -w '\n%{http_code}'" \
        "200"
}

# Performance and Load Testing
test_performance() {
    log_info "=== Performance Testing ==="
    
    # Test concurrent workout generation
    log_info "Testing concurrent workout generation (5 requests)..."
    for i in {1..5}; do
        curl -s -X POST "$API_BASE/workouts/quick-generate" \
            -H "Authorization: $AUTH_TOKEN" \
            -H "Content-Type: application/json" &
    done
    wait
    log_success "Concurrent requests completed"
    
    # Test response times
    log_info "Testing response times..."
    time curl -s -X GET "$API_BASE/workouts/predictive-schedule" \
        -H "Authorization: $AUTH_TOKEN" > /dev/null
}

# Validation Tests
test_data_validation() {
    log_info "=== Data Validation Testing ==="
    
    # Test invalid workout generation request
    run_test "Invalid Workout Request" \
        "curl -s -X POST '$API_BASE/workouts/generate' \
        -H 'Authorization: $AUTH_TOKEN' \
        -H 'Content-Type: application/json' \
        -d '{
            \"experience\": \"invalid_experience\",
            \"duration\": -10
        }' \
        -w '\n%{http_code}'" \
        "400"
    
    # Test missing authentication
    run_test "Missing Authentication" \
        "curl -s -X GET '$API_BASE/workouts/predictive-schedule' \
        -w '\n%{http_code}'" \
        "401"
}

# Main execution
main() {
    echo "🚀 AI Workout Backend Enhancement Testing Suite"
    echo "=============================================="
    
    # Check if server is running
    if ! curl -s "$BASE_URL/health" > /dev/null; then
        log_error "Server is not running at $BASE_URL"
        log_info "Please start the server with: npm run dev"
        exit 1
    fi
    
    log_success "Server is running at $BASE_URL"
    
    # Setup
    setup_test_user
    
    # Run all tests
    test_enhanced_workout_generation
    test_biometric_integration
    test_intelligent_progression
    test_real_time_coaching
    test_integration_ecosystem
    test_frictionless_ux
    test_performance
    test_data_validation
    
    # Summary
    echo "=============================================="
    echo "🏁 Test Summary"
    echo "=============================================="
    echo "Total Tests: $TOTAL_TESTS"
    echo -e "Passed: ${GREEN}$PASSED_TESTS${NC}"
    echo -e "Failed: ${RED}$FAILED_TESTS${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        exit 1
    fi
}

# Run main function
main "$@"
